import type {Metadata} from "next";
import Image from "next/image";
import "./iot.css";

export const metadata: Metadata = {
    title: "Island of Time",
    description: "Miraculixx Website - Some stuff made by me",
};

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <body>
        <div className="min-h-screen bg-[#0d0d0d] text-gray-100">

            {/* Wallpaper and Title */}
            <div className="relative h-80">
                <Image
                    src="/img/iot/bg4.webp"
                    alt="Island of Time"
                    layout="fill"
                    className="z-0"
                    priority={true}
                    style={{maskImage: "linear-gradient(180deg,#000,transparent)", opacity: 0.8, objectFit: "cover", objectPosition: "center"}}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <h1 className="headline text-6xl font-extrabold drop-shadow-lg">
                        Island of Time
                    </h1>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16">
                {children}
            </div>
        </div>
        </body>
        </html>
    );
}
