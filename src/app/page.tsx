
export default function Home() {
    const projects = [
        {"link": "https://mutils.net", "name": "MUtils (Minecraft Stuff)"},
        {"link": "https://miraculixx.de/iot", "name": "Island of Time"},
        {"link": "https://github.com/MiraculixxT", "name": "GitHub Profile"},
    ];

    return (
        <>
            <main className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white px-6">
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-6xl font-bold mb-4">
                        {"Hey I'm "}
                        <span className="text-purple-500">Julius (Miraculixx)</span>
                    </h1>
                    <div className="bg-gray-800 text-gray-300 rounded-lg shadow-lg p-6 md:p-8">
                        <p className="text-lg md:text-xl">
                            Temporary landing page, because i have no time like always :)
                        </p>
                        <p className="text-lg md:text-xl">You can check out some other projects...</p>
                    </div>
                </div>

                <div className="flex flex-col items-center space-y-4 w-80">
                    <h2 className="text-2xl font-semibold text-purple-500">Some Stuff</h2>
                    {projects.map((project, index) => (
                        <a
                            key={index}
                            href={project.link}
                            rel="noopener noreferrer"
                            className="px-6 py-3 w-full bg-purple-600 text-white text-center rounded-lg shadow hover:bg-purple-500 transition"
                        >{project.name}</a>
                    ))}
                </div>
            </main>
        </>
    );
}
