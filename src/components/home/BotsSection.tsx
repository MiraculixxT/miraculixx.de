'use client';
import Image, {type StaticImageData} from "next/image";
import {useState, type ReactNode} from "react";
import Display from "@/components/site/Display";
import mgameIcon from "./img/mgame-club.png";
import ghgIcon from "./img/ghg-bot.png";
import meIcon from "./img/me.jpg";

type Channel = { id: string; name: string };
type Server = { id: string; icon: StaticImageData; name: string; color: string; github: string; categories: { name: string; channels: Channel[] }[] };

const servers: Server[] = [
    {
        id: "mg", icon: mgameIcon, name: "MGame Club", color: "#f0b232", github: "https://github.com/MiraculixxT/MGame-Club",
        categories: [
            {name: "INFO", channels: [{id: "mg-about", name: "about"}]},
            {name: "GAMES", channels: [{id: "mg-c4", name: "connect-4"}, {id: "mg-ttt", name: "tic-tac-toe"}, {id: "mg-flag", name: "guess-the-flag"}, {id: "mg-trivia", name: "trivia"}]},
        ],
    },
    {
        id: "ghg", icon: ghgIcon, name: "BastiGHG Moderation", color: "#4f7cff", github: "https://github.com/MiraculixxT/GHG-Bot",
        categories: [{name: "INFO", channels: [{id: "ghg-about", name: "about"}]}],
    },
];

const mention = (name: string) => <span className="rounded-sm bg-[#5865f24d] px-0.5 text-[#c9cdfb]">@{name}</span>;

function Msg({avatar, name, bot, time, children}: { avatar: ReactNode; name: string; bot?: boolean; time: string; children: ReactNode }) {
    return (
        <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 sm:h-10 sm:w-10 items-center justify-center overflow-hidden rounded-full bg-[#1e1f22]">{avatar}</div>
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-white">{name}
                    {bot && <span className="rounded-sm bg-[#5865f2] px-1 font-silk text-[9px]">APP</span>}
                    <span className="text-xs text-[#949ba4]">{time}</span>
                </div>
                <div className="mt-1 text-[16px]">{children}</div>
            </div>
        </div>
    );
}

function Container({accent, children}: { accent: string; children: ReactNode }) {
    return <div className="max-w-[520px] rounded border-l-4 bg-[#2b2d31] px-4 py-3" style={{borderColor: accent}}>{children}</div>;
}

const Sep = () => <hr className="my-2 border-[#3f4147]"/>;
const me = <Image src={meIcon} alt="" width={40} height={40} className="h-full w-full object-cover"/>;
const botAvatar = (s: Server) => <Image src={s.icon} alt="" width={40} height={40} className="h-full w-full object-cover"/>;

function About({server, text, features}: { server: Server; text: string; features: string[] }) {
    return (
        <Msg avatar={botAvatar(server)} name={server.name} bot time="Today at 15:04">
            <Container accent={server.color}>
                <b className="text-white">{server.name}</b>
                <p className="mt-1 text-[#c4c9ce]">{text}</p>
                <ul className="mt-2 grid gap-x-6 text-[#c4c9ce] sm:grid-cols-2">{features.map(f => <li key={f}>▸ {f}</li>)}</ul>
                <a href={server.github} target="_blank" rel="noopener noreferrer" className="dc-btn mt-3 hover:brightness-110">GitHub ↗</a>
            </Container>
        </Msg>
    );
}

const board = [
    "⚪⚪⚪⚪⚪⚪⚪",
    "⚪⚪⚪⚪⚪⚪⚪",
    "⚪⚪⚪⚪⚪⚪⚪",
    "⚪⚪⚪🔴⚪⚪⚪",
    "⚪⚪🤖🔴🤖⚪⚪",
    "⚪🔴🤖🔴🤖⚪⚪",
];

function ConnectFour({server}: { server: Server }) {
    return (
        <>
            <Msg avatar={me} name="Miraculixx" time="Today at 15:02"><span className="text-[#c9cdfb]">/connect4</span> <span className="text-[#949ba4]">opponent:</span> {mention(server.name)}</Msg>
            <Msg avatar={botAvatar(server)} name={server.name} bot time="Today at 15:02">
                <Container accent="#f0b232">
                    <b className="text-lg text-white">Connect-4</b>
                    <Sep/>
                    <p>🔴 - {mention("Miraculixx")}<br/>🤖 - <code className="rounded bg-[#1e1f22] px-1 text-[14px]">Bot Level 2</code></p>
                    <Sep/>
                    <p className="border-l-4 border-[#4e5058] pl-2">{mention("Miraculixx")} is on move</p>
                    <div className="mt-2 border-l-4 border-[#4e5058] pl-2 whitespace-nowrap font-term text-[15px] leading-[1.15] sm:text-[20px]">
                        {board.map((r, i) => <div key={i}><b>║</b> {r} <b>║</b></div>)}
                        <div><b>║</b> 1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣7️⃣ <b>║</b></div>
                    </div>
                    <div className="mt-2 flex max-w-[260px] flex-col gap-1.5">
                        <div className="flex gap-1.5">{[2, 3, 4, 5, 6].map(n => <span key={n} className="dc-btn green min-w-0 flex-1 sm:min-w-[44px] sm:flex-none">{n}</span>)}</div>
                        <div className="flex gap-1.5"><span className="dc-btn green min-w-0 flex-1 sm:min-w-[44px] sm:flex-none">1</span>{[0, 1, 2].map(n => <span key={n} className="dc-btn off min-w-0 flex-1 sm:min-w-[44px] sm:flex-none"/>)}<span className="dc-btn green min-w-0 flex-1 sm:min-w-[44px] sm:flex-none">7</span></div>
                    </div>
                </Container>
            </Msg>
        </>
    );
}

const ttt = ["X", "", "O", "", "X", "", "O", "", ""];

function TicTacToe({server}: { server: Server }) {
    return (
        <>
            <Msg avatar={me} name="Miraculixx" time="Today at 15:03"><span className="text-[#c9cdfb]">/tictactoe</span> <span className="text-[#949ba4]">opponent:</span> {mention(server.name)}</Msg>
            <Msg avatar={botAvatar(server)} name={server.name} bot time="Today at 15:03">
                <Container accent="#da373c">
                    <b className="text-lg text-white">TIC TAC TOE</b>
                    <Sep/>
                    <p><span className="text-[#da373c]">✕</span> - Red {mention("Miraculixx")}<br/><span className="text-[#248046]">◯</span> - Green <code className="rounded bg-[#1e1f22] px-1 text-[14px]">Bot Level 2</code></p>
                    <Sep/>
                    <p className="border-l-4 border-[#4e5058] pl-2">{mention("Miraculixx")} is on move</p>
                    <div className="mt-2 grid w-max grid-cols-3 gap-1.5">
                        {ttt.map((c, i) => <span key={i} className={`dc-btn h-11 w-14 text-lg ${c === "X" ? "red" : c === "O" ? "green" : ""}`}>{c === "X" ? "✕" : c === "O" ? "◯" : ""}</span>)}
                    </div>
                </Container>
            </Msg>
        </>
    );
}

function Header({title, button}: { title: string; button: string }) {
    return (
        <div className="flex items-center justify-between gap-4">
            <b className="text-lg text-white">{title}</b>
            <span className="dc-btn blurple font-silk text-xs">{button}</span>
        </div>
    );
}

const Quote = ({children}: { children: ReactNode }) => <div className="border-l-4 border-[#4e5058] pl-2 leading-relaxed">{children}</div>;
const Code = ({children}: { children: ReactNode }) => <code className="rounded border border-[#3f4147] bg-[#1e1f22] px-1 text-[14px]">{children}</code>;

function GuessTheFlag({server}: { server: Server }) {
    return (
        <>
            <Msg avatar={me} name="Miraculixx" time="Today at 15:05"><span className="text-[#c9cdfb]">/guess-the-flag</span></Msg>
            <Msg avatar={botAvatar(server)} name={server.name} bot time="Today at 15:05">
                <Container accent="#c99d11">
                    <Header title="🏁 || Guess The Flag" button="PLAY"/>
                    <b className="mt-1 block text-white">⭐ First Try!</b>
                    <Sep/>
                    <svg viewBox="0 0 16 10" className="w-full max-w-[420px] rounded-lg" aria-label="Flag of Sweden">
                        <rect width={16} height={10} fill="#005293"/>
                        <rect x={5} width={2} height={10} fill="#fecb00"/>
                        <rect y={4} width={16} height={2} fill="#fecb00"/>
                    </svg>
                    <Sep/>
                    <Quote>Country &gt;&gt; <Code>Sweden</Code><br/>Attempts &gt;&gt; <Code>1</Code></Quote>
                    <p className="mt-1 text-sm text-[#949ba4]">By {mention("Miraculixx")} || +5 🪙</p>
                </Container>
            </Msg>
        </>
    );
}

const answers = [{t: "1996", c: "off"}, {t: "1998", c: "green"}, {t: "2000", c: "off"}, {t: "2001", c: "off"}];

function Trivia({server}: { server: Server }) {
    return (
        <>
            <Msg avatar={me} name="Miraculixx" time="Today at 15:06"><span className="text-[#c9cdfb]">/trivia</span></Msg>
            <Msg avatar={botAvatar(server)} name={server.name} bot time="Today at 15:06">
                <Container accent="#248046">
                    <Header title="🧩 || Trivia Quiz" button="REPLAY"/>
                    <Sep/>
                    <Quote>Difficulty &gt;&gt; <Code>Easy (random)</Code><br/>Category &gt;&gt; <Code>Entertainment - Video Games</Code></Quote>
                    <div className="mt-4 rounded border border-[#3f4147] bg-[#1e1f22] px-3 py-2 font-term text-[19px] leading-tight text-[#23a55a]">
                        ✓ When did the original Legend of Zelda: Ocarina of Time released?
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">{answers.map(a => <span key={a.t} className={`dc-btn ${a.c}`}>{a.t}</span>)}</div>
                </Container>
            </Msg>
        </>
    );
}

function Content({channel}: { channel: string }) {
    const [mg, ghg] = servers;
    switch (channel) {
        case "mg-c4": return <ConnectFour server={mg}/>;
        case "mg-ttt": return <TicTacToe server={mg}/>;
        case "mg-flag": return <GuessTheFlag server={mg}/>;
        case "mg-trivia": return <Trivia server={mg}/>;
        case "ghg-about": return <About server={ghg} text="Private bot for the BastiGHG community Discord. Automates most moderation tasks and adds a few small extra features."
                                        features={["Moderation automation", "Small community extras", "Custom ticket system"]}/>;
        default: return <About server={mg} text="Play classic and new games directly in Discord – modern, user friendly and built on a custom JDA fork."
                               features={["Tic-Tac-Toe & Connect-4", "Quick Math, Trivia, Guess the Flag", "Play vs friends or bots", "Coins, streaks & daily challenges"]}/>;
    }
}

export default function BotsSection() {
    const [server, setServer] = useState(servers[0]);
    const [channel, setChannel] = useState("mg-c4");
    const all = server.categories.flatMap(c => c.channels);
    const current = all.find(c => c.id === channel) ?? all[0];
    const pick = (s: Server) => { setServer(s); setChannel(s.categories[0].channels[0].id); };

    return (
        <Display id="bots" index="03" title="DISCORD BOTS" led="#5865f2" meta={`${servers.length} BOTS`}>
            <div className="flex min-h-[460px] bg-[#313338] text-[#dbdee1]">
                <div className="flex w-[56px] shrink-0 sm:w-[64px] flex-col items-center gap-2 bg-[#1e1f22] py-3">
                    {servers.map(s => (
                        <button key={s.id} onClick={() => pick(s)} title={s.name} aria-label={s.name} className="group relative flex w-full justify-center">
                            <span className={`absolute left-0 top-1/2 w-1 -translate-y-1/2 rounded-r bg-white transition-all ${s.id === server.id ? "h-10" : "h-0 group-hover:h-5"}`}/>
                            <Image src={s.icon} alt="" width={48} height={48}
                                   className={`h-12 w-12 bg-[#313338] object-cover transition-all ${s.id === server.id ? "rounded-2xl" : "rounded-3xl group-hover:rounded-2xl"}`}/>
                        </button>
                    ))}
                </div>
                <div className="hidden w-[210px] shrink-0 bg-[#2b2d31] px-2 py-3 sm:block">
                    <div className="mb-3 border-b-2 border-[#1f2023] px-2 pb-3 font-silk text-sm text-white">{server.name}</div>
                    {server.categories.map(cat => (
                        <div key={cat.name}>
                            <div className="mx-2 mb-1 mt-3 font-silk text-[10px] text-[#949ba4]">▾ {cat.name}</div>
                            {cat.channels.map(c => (
                                <button key={c.id} onClick={() => setChannel(c.id)}
                                        className={`block w-full rounded px-2 py-1 text-left ${c.id === current.id ? "bg-[#404249] text-white" : "text-[#949ba4] hover:bg-[#35373c] hover:text-[#dbdee1]"}`}>
                                    <span className="mr-1.5 text-[#80848e]">#</span>{c.name}
                                </button>
                            ))}
                        </div>
                    ))}
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex h-12 items-center gap-2 border-b-2 border-[#26282c] px-4 text-white">
                        <span className="hidden sm:inline">
                        <span className="mr-2 text-[#80848e]">#</span>{current.name}</span>
                        <div className="flex gap-1 overflow-x-auto sm:hidden">
                            {all.map(c => <button key={c.id} onClick={() => setChannel(c.id)} className={`whitespace-nowrap rounded px-2 text-sm ${c.id === current.id ? "bg-[#404249]" : "text-[#949ba4]"}`}>#{c.name}</button>)}
                        </div>
                    </div>
                    <div className="flex flex-1 flex-col gap-5 overflow-x-auto p-3 [scrollbar-color:#1e1f22_transparent] [scrollbar-width:thin] sm:p-4"><Content channel={current.id}/></div>
                    <div className="mx-4 mb-4 rounded-lg bg-[#383a40] px-4 py-2.5 text-[#6d6f78]">Message #{current.name}</div>
                </div>
            </div>
        </Display>
    );
}
