'use client';
import React, {useEffect, useState} from "react";
import {accessProtectedAPI, fetchMediaFile} from "@/components/apiRequests";
import {getToken} from "@/components/tokenCookie";
import {API_URL} from "@/app/config";
import {TextModal} from "@/components/TextModal";

type Character = { id: string, name: string, description: string, editor: [number], texts: [string] };
type CharacterEntry = Record<string, Character>;
type Voice = { examples: [string], submissions: [string] }
type Voices = Record<string, Voice>

export default function VoiceManaging() {
    const [characters, setCharacters] = useState<CharacterEntry>({});
    const [isEditor, setIsEditor] = useState(false);
    const [voices, setVoices] = useState<Voices>({});
    const [isModalOpen, setIsModalOpen] = useState<string | null>(null);

    useEffect(() => {
        retrieveCharacters(setCharacters, setIsEditor).then(() => {
        });
    }, []);

    const handleModalClose = (content: string | null) => {
        if (content) {
            accessProtectedAPI('iot/voice/edit', {}, '/iot/voice', 'POST', content).then(() => {
                setIsModalOpen(null);
            });
        } else setIsModalOpen(null);
    }

    return (
        <div>
            <TextModal
                name="Character Editor"
                content={isModalOpen}
                isOpen={isModalOpen !== null} onClose={(content) => handleModalClose(content)}/>
            <h2 className="text-3xl font-bold text-center mb-12" id="state-header">Loading...</h2>
            <div className="bg-[#1a1a1a] p-6 rounded-xl border border-gray-700 mb-12">
                {listCharacters(characters, isEditor, setVoices, voices, setIsModalOpen)}
                {isEditor && (
                    <button
                        onClick={() => setIsModalOpen(JSON.stringify({id: '', name: '', description: '', editor: [], texts: ['']}, null, 3))}
                        className="w-full bg-purple-600 text-white py-3 mt-2 rounded-lg hover:bg-purple-700 transition"
                    >Create Character</button>
                )}
            </div>
        </div>
    );
}

async function retrieveCharacters(setCharacters: React.Dispatch<React.SetStateAction<CharacterEntry>>, setIsEditor: React.Dispatch<React.SetStateAction<boolean>>) {
    const response = await accessProtectedAPI('iot/voice/list', {}, '/iot/voice');
    const header = document.getElementById('state-header');
    if (!response.ok) {
        console.warn('Failed to retrieve characters:', response.status);
        if (header) header.innerText = 'API currently not reachable!';
        return;
    }
    const data = await response.json();
    if (data.size === 0) {
        if (header) header.innerText = 'You have no access!';
        return;
    }
    setCharacters(data);

    const responseEditor = await accessProtectedAPI('iot/voice/is-editor', {}, '/iot/voice');
    if (!responseEditor.ok) {
        console.warn('Failed to retrieve editor status:', responseEditor.status);
        return;
    }
    const isEditor = await responseEditor.text();
    setIsEditor(isEditor === 'true');
}

function listCharacters(
    characters: CharacterEntry,
    isEditor: boolean,
    setVoices: React.Dispatch<React.SetStateAction<Voices>>,
    voices: Voices,
    setIsModalOpen: React.Dispatch<React.SetStateAction<string | null>>
) {
    if (Object.keys(characters).length === 0) return <div></div>

    const structure = Object.entries(characters).map(([id, character]) => {
        const getListText = (text: string, index: number, texts: [string]) => {
            const design = index === texts.length - 1 ? 'bg-[#2a2a2a] rounded-lg text-gray-300 w-full' : 'bg-[#2a2a2a] rounded-lg text-gray-300 w-full mb-1';
            return (
                <div key={index} className={design}>
                    <p className="p-3 pb-2">{text}</p>
                    {voices[id] &&
                        <div className="flex">
                            <audio
                                controls
                                className="w-full rounded-lg bg-[#2a2a2a]"
                                style={{borderTopRightRadius: '0', borderBottomRightRadius: '0'}}
                                src={voices[id]?.examples[index]}
                            >Your browser does not support audio elements!
                            </audio>
                            <audio
                                controls
                                className="w-full rounded-lg bg-[#2a2a2a]"
                                style={{borderTopLeftRadius: '0', borderBottomLeftRadius: '0'}}
                                src={voices[id]?.submissions[index]}
                            >Your browser does not support audio elements!
                            </audio>
                        </div>
                    }
                </div>
            );
        }

        return (
            <div key={id}>
                <details>
                    <summary className="text-2xl font-bold mb-4 select-none">
                        {character.name}
                        <a href={"/iot/voice/" + id} target="_blank" className="text-blue-400 text-xl">{" 🔗"}</a>
                    </summary>
                    <p className="bg-[#2a2a2a] p-3 rounded-lg text-white w-full">{character.description}</p>

                    <div className="bg-[#1a1a1a] rounded-xl border border-gray-700 mb-3 mt-4">
                        {character.texts.map((value, index) => getListText(value, index, character.texts))}
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => loadVoices(id, character.texts.length, setVoices, voices)}
                            className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition"
                        >Load Voices
                        </button>
                        {isEditor && (
                            <button
                                onClick={() => setIsModalOpen(JSON.stringify(character, null, 3))}
                                className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition"
                            >Edit Character</button>
                        )}
                    </div>
                </details>
            </div>
        );
    });
    const header = document.getElementById('state-header');
    if (header) header.innerText = 'Alle verfügbaren Charaktere';
    return structure;
}

async function loadVoices(
    charID: string,
    voiceAmount: number,
    setVoices: React.Dispatch<React.SetStateAction<Voices>>,
    oldVoices: Voices
) {
    const voiceData: Voice = {examples: [""], submissions: [""]};
    const token = await getToken();
    if (token === '') {
        console.warn('Failed to retrieve token');
        return;
    }

    for (let i = 0; i < voiceAmount; i++) {
        voiceData.examples[i] = await fetchMediaFile(`${API_URL}/iot/voice/audio/${charID}/${i}`, {"Authorization": `${token}`}) || "";
        voiceData.submissions[i] = await fetchMediaFile(`${API_URL}/iot/voice/audi/submits/${charID}/${i}`, {"Authorization": `${token}`}) || "";
    }

    console.log(voiceData);
    const newVoices = {...oldVoices, [charID]: voiceData};
    setVoices(newVoices);
}
