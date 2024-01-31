"use client";

import { CircularProgress } from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const LandingPage = () => {
    const router = useRouter();

    useEffect(() => {
        router.push('/inventory');
    }, []);

    return <div> <CircularProgress /> </div>
}

export default LandingPage;