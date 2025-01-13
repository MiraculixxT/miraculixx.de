import React, {useEffect, useRef} from "react";

export function TextModal(
    { isOpen, content, onClose, name }:
    { isOpen: boolean, content: string | null, onClose: (content: string | null) => void, name: string }
) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const handleTabPress = (event: KeyboardEvent) => {
            if (event.key === 'Tab') {
                event.preventDefault();
                const textarea = textareaRef.current;
                if (textarea) {
                    const start = textarea.selectionStart;
                    const end = textarea.selectionEnd;
                    const value = textarea.value;
                    textarea.value = value.substring(0, start) + "   " + value.substring(end);
                    textarea.selectionStart = textarea.selectionEnd = start + 3;
                }
            }
        };

        const textarea = textareaRef.current;
        if (textarea) {
            textarea.addEventListener('keydown', handleTabPress);
        }

        return () => {
            if (textarea) {
                textarea.removeEventListener('keydown', handleTabPress);
            }
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleClickOutside = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (e.target === e.currentTarget) {
            onClose(null);
        }
    };

    return (
        <div
            className="fixed top-0 left-0 w-full h-full flex justify-center items-center"
            style={{zIndex: 1000}}>
            <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-30"
                 style={{backdropFilter: "blur(2px)"}}
                 onClick={handleClickOutside}/>
            <div className="relative flex flex-col bg-[#1a1a1a] p-6 rounded-xl border border-gray-700 mb-12">
                <div className="flex justify-between pb-2 -mt-2">
                    <p className="text-xl font-bold">{name}</p>
                    <button
                        onClick={() => onClose(content)}
                        className="bg-purple-600 w-20 text-white py-2 rounded-lg -mt-2 hover:bg-purple-700 transition"
                    >Save</button>
                </div>
                <textarea
                    ref={textareaRef}
                    className="bg-[#2a2a2a] p-3 rounded-lg text-white"
                    style={{width: '80vw', height: '60vh'}}
                    defaultValue={content || ""}
                    onChange={(e) => content = e.target.value}
                />
            </div>
        </div>
    );
}
