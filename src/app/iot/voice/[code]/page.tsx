'use client';
import Image from 'next/image';
import {FormEvent} from "react";
import {useEffect, useState} from 'react';

export default function VoiceActingSubmission({params}: {
    params: Promise<{ code: string }>
}) {
    const [texts, setTexts] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        async function fetchData() {
            const {code} = await params;
            const texts = await getTextID(code);
            setTexts(texts);
        }

        fetchData().then(r => {
            console.debug("Data fetched:", r)
        })
    }, [params]);

    const handleSubmit = (event: FormEvent<HTMLFormElement>, textKey: string) => {
        event.preventDefault();
        const file = event.target.elements[`upload-${textKey}`].files[0];
        if (file) {
            console.log(`File submitted for ${textKey}:`, file);
            // Implement actual file upload logic here
        }
    };

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-gray-100">
            {/* Wallpaper and Title */}
            <div className="relative h-64 bg-gradient-to-b from-transparent to-[#0d0d0d]">
                <Image
                    src="/img/iot/header.png"
                    alt="Island of Time"
                    layout="fill"
                    objectFit="cover"
                    objectPosition="center"
                    className="z-0"
                />
                <div className="absolute inset-0 flex items-center justify-center z-10 bg-black bg-opacity-40">
                    <h1 className="text-white text-5xl font-extrabold drop-shadow-lg">
                        Island of Time
                    </h1>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-16">
                <h2 className="text-3xl font-bold text-center mb-12">Submit Your Voice Acting</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {Object.entries(texts).map(([textKey, text]) => (
                        <div
                            key={textKey}
                            className="flex flex-col justify-between p-6 bg-[#1a1a1a] shadow-xl rounded-xl border border-gray-700 transition-transform transform hover:scale-105"
                        >
                            <div className="bg-[#2a2a2a] p-3 rounded-xl h-[100%] mb-4">
                                <p className="font-semibold text-xl mb-4">{text}</p>
                            </div>

                            <div>
                                <audio
                                    controls
                                    className="mb-4 w-full rounded-lg"
                                    src={`/audio/iot/${textKey}.mp3`}
                                >
                                    Your browser does not support the audio element.
                                </audio>
                                <form onSubmit={(e) => handleSubmit(e, textKey)}>
                                    <input
                                        type="file"
                                        accept="audio/mp3, audio/wav, audio/ogg"
                                        id={`upload-${textKey}`}
                                        className="block w-full mb-4 border border-gray-600 bg-[#2a2a2a] text-gray-100 rounded-lg p-3"
                                    />
                                    <button
                                        type="submit"
                                        className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition"
                                    >
                                        Submit
                                    </button>
                                </form>
                            </div>

                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export async function getTextID(textID: string) {
    // Send API request to fetch text data

    return {
        "text0": textID,
        "text1": "The quick brown fox jumps over the lazy dog.",
        "text2": "She sells seashells by the seashore.",
        "text3": "How much wood would a woodchuck chuck if a woodchuck could chuck wood?"
    }
}
