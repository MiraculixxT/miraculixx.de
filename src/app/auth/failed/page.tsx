'use client';
import Image from 'next/image';

export default function AuthenticationFailed() {

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-gray-100">
            <div className="container mx-auto px-4 py-16">
                <div className="flex justify-center">
                    <Image
                        src="/img/svg/lock.svg"
                        alt="Lock Icon"
                        width={300}
                        height={300}
                        priority={true}
                        style={{objectPosition: "center"}}
                    />
                </div>
                <h2 className="text-3xl font-bold text-center mb-6">Authentication Failed</h2>
                <p className="text-center">Please try again to access the page or return to start.</p>
                <div>
                    <button
                        className="block w-full md:w-1/2 mx-auto mt-8 p-4 bg-[#2a2a2a] text-gray-100 rounded-lg border-2 border-[#2a2a2a] hover:border-purple-600 transition"
                        onClick={() => window.history.back()}
                    >Retry Login</button>
                    <button
                        className="block w-full md:w-1/2 mx-auto mt-4 p-4 bg-[#2a2a2a] text-gray-100 rounded-lg border-2 border-[#2a2a2a] hover:border-purple-600 transition"
                        onClick={() => window.location.href = '/'}
                    >Return to Start</button>
                </div>
            </div>
        </div>
    );
}