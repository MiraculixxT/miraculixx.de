'use client';
import React, {Dispatch, FormEvent, SetStateAction, useRef} from "react";
import {useEffect, useState} from 'react';
import {accessProtectedAPI, fetchMediaFile} from "@/components/apiRequests";
import {API_URL} from "@/app/config";
import {getToken} from "@/components/tokenCookie";

export default function VoiceActingSubmission({params}: {
    params: Promise<{ code: string }>
}) {
    const [character, setCharacter] = useState<{ name: string, description: string, texts: [string], audios: [string] }>({name: '', description: '', texts: [''], audios: ['']});
    const [code, setCode] = useState<string>('');
    const [file, setFile] = useState<[string] | []>([]);
    const isEnglish = useRef<boolean>(false);

    useEffect(() => {
        async function fetchData() {
            const {code} = await params;
            const char = await getCharacter(code);
            setCharacter(char);
            setCode(code);
            isEnglish.current = code.endsWith('-en');
        }

        fetchData().then(() => {});
    }, [params]);

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-gray-100">
            {/* Main Content */}
            {buildCharacter(character, code, file, setFile)}
            {
                isEnglish && character.description !== '' && (
                    <div className="flex flex-col items-center bg-[#1a1a1a] p-6 rounded-xl border border-gray-700 mt-20">
                        <p className="font-semibold text-m">In der Zukunft planen wir die Map frei hochzuladen in Deutsch & Englisch.
                            Wenn du möchtest, kannst du auch die englischen Texte einsprechen :)</p><br/>
                        <p className="font-semibold text-m">Melde dich dazu einfach beim Team</p>
                    </div>
                )
            }
        </div>
    );
}

async function getCharacter(textID: string): Promise<{ name: string, description: string, texts: [string], audios: [string] }> {
    // Send API request to fetch text data
    const response = await accessProtectedAPI('iot/voice/get', {'character': textID}, `/iot/voice/${textID}`);
    if (response.status === 404) return {name: '0', description: '', texts: [''], audios: ['']};
    const body = await response.json();

    const token = await getToken() as string; // can not be null through previouse request
    body.audios = [];
    for (let i = 0; i < body.texts.length; i++) {
        body.audios[i] = await fetchMediaFile(`${API_URL}/iot/voice/audio/${textID}/${i}`, {'Authorization': token});
    }
    console.log('Character data:', body);

    return body;
}

function buildCharacter(
    character: { name: string, description: string, texts: [string], audios: [string] },
    code: string,
    file: [string] | [],
    setFile: Dispatch<SetStateAction<[string] | []>>) {
    const handleSubmit = async (event: FormEvent<HTMLFormElement>, textKey: number) => {
        event.preventDefault();
        const submitButton = event.currentTarget.querySelector('button[type="submit"]') as HTMLButtonElement;
        if (submitButton) submitButton.style.backgroundColor = '';
        const input = event.currentTarget.querySelector(`#upload-${textKey}`) as HTMLInputElement;
        const file = input?.files?.[0];

        if (!file) {
            console.error('No file selected!');
            return;
        }

        const fileName = file.name;
        if (!fileName.endsWith(".mp3") && !fileName.endsWith(".ogg")) {
            console.error('Invalid file format!');
            alert('Invalid file format! Please only upload a .mp3 or .ogg file.');
            if (submitButton) submitButton.style.backgroundColor = 'red';
            return;
        }

        console.log(`Uploading file for ${textKey}:`, input);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = await getToken();
            const response = await fetch(`${API_URL}/iot/voice/audio/${code}/${textKey}`, {
                method: 'POST',
                headers: {
                    'Authorization': `${token}`,
                    'AudioType': fileName.substring(fileName.lastIndexOf('.') + 1)
                },
                body: formData
            });

            if (!response.ok) {
                console.warn('File upload failed:', response.status);
                if (submitButton) submitButton.style.backgroundColor = 'darkred';
                return;
            }

            console.log(`File uploaded successfully for ${textKey}`);
            if (submitButton) submitButton.style.backgroundColor = '#15974e';
        } catch (error) {
            console.warn('File upload failed:', error);
            if (submitButton) submitButton.style.backgroundColor = 'red';
        }
    };

    const handleInput = (e: FormEvent<HTMLFormElement>, textKey: number, file: [string] | [], setFile: React.Dispatch<React.SetStateAction<[string] | []>>) => {
        const event = e as unknown as React.ChangeEvent<HTMLInputElement>;
        const input = event.target.files?.[0];
        if (input) {
            const url = URL.createObjectURL(input);
            console.log(`File uploaded for ${textKey}:`, url);
            const prevFiles = {...file};
            prevFiles[textKey] = url;
            setFile(prevFiles);
        }
    }

    switch (character.name) {
        case '-1':
            return <h2 className="text-3xl font-bold text-center mb-12">API currently not reachable!</h2>;
        case '':
            return <h2 className="text-3xl font-bold text-center mb-12">Loading...</h2>;
        case '0':
            return (
                <div>
                    <h2 className="text-3xl font-bold text-center mb-12">{"Charakter nicht gefunden!"}</h2>
                    <p className="text-center">{"Möglicherweise hast du nur keinen Zugriff auf diesen Charakter"}</p>
                    <p className="text-center">{"Melde dich in diesem Fall bei @miraculixx"}</p>
                </div>
            );
        default:
            return (
                <div>
                    <h2 className="text-3xl font-bold text-center mb-12">Charakter Beschreibung</h2>
                    <div className="bg-[#1a1a1a] p-6 rounded-xl border border-gray-700 mb-12">
                        <h3 className="text-2xl font-bold mb-4">{character.name}</h3>
                        <p className="font-semibold text-m">{character.description}</p>
                    </div>

                    <h2 className="text-3xl font-bold text-center mb-12">Verfügbare Voice Lines</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {character.texts.map((value, index) => (
                            <div
                                key={index}
                                className="flex flex-col justify-between p-6 bg-[#1a1a1a] shadow-xl rounded-xl border border-gray-700 transition-transform transform hover:scale-105"
                            >
                                <div className="bg-[#2a2a2a] p-3 rounded-xl h-[100%] mb-4">
                                    <p className="font-semibold text-m mb-4">{value}</p>
                                </div>

                                <div>
                                    <audio
                                        controls
                                        crossOrigin="anonymous"
                                        className="mb-4 w-full rounded-lg"
                                        src={character.audios[index]}
                                    >Your browser does not support audio elements!
                                    </audio>
                                    <form
                                        onSubmit={(e) => handleSubmit(e, index)}
                                        onChange={(e) => handleInput(e, index, file, setFile)}>
                                        <div className="border border-gray-600 bg-[#2a2a2a] rounded-lg mb-4">
                                            <input
                                                type="file"
                                                accept="audio/mp3, audio/ogg"
                                                id={`upload-${index}`}
                                                className="block w-full text-gray-100 p-3"
                                            />
                                            {file[index] && (
                                                <audio
                                                    controls
                                                    crossOrigin="anonymous"
                                                    className="w-full rounded-lg"
                                                    src={file[index]}
                                                >Your browser does not support audio elements!</audio>
                                            )}
                                        </div>
                                        <button
                                            type="submit"
                                            className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition"
                                        >Submit
                                        </button>
                                    </form>
                                </div>

                            </div>
                        ))}
                    </div>
                    <div className="flex flex-col items-center bg-[#1a1a1a] p-6 rounded-xl border border-gray-700 mt-20">
                        <p className="font-semibold text-m text-center">Wenn du optionale Alternativen zu den Einsendungen geben möchtest, kannst du eine ungeschnittene Datei hier hochladen.
                        </p>
                        <form onSubmit={(e) => handleSubmit(e, -1)}>
                            <div className="border border-gray-600 bg-[#2a2a2a] rounded-t-lg mt-2">
                                <input
                                    type="file"
                                    accept="audio/mp3, audio/ogg"
                                    id={`upload--1`}
                                    className="block w-full text-gray-100 p-3"
                                />
                            </div>
                            <button
                                type="submit"
                                className="bg-purple-600 text-white py-3 rounded-b-lg hover:bg-purple-700 transition"
                                style={{width: '80vh'}}
                            >Submit
                            </button>
                        </form>
                    </div>
                </div>
            );
    }
}
