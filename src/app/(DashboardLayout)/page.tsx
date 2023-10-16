"use client";

import { useRouter } from "next/navigation";

const LandingPage = () => {
    const router = useRouter();
    router.push('/inventory');
    return <div>Dash Loading</div>
}

export default LandingPage;