'use client';
import SiteShell from "@/components/site/SiteShell";
import MessagePanel, {panelButton} from "@/components/site/MessagePanel";

export default function AuthenticationFailed() {
    return (
        <SiteShell>
            <MessagePanel title="LOGIN FAILED">
                <p>Please try again to access the page or return to start.</p>
                <button className={`${panelButton} mt-6 hover:[--notch:#ff4d6d]`} onClick={() => window.history.back()}>Retry login</button>
                <button className={panelButton} onClick={() => window.location.href = '/'}>Return to start</button>
            </MessagePanel>
        </SiteShell>
    );
}
