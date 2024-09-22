import { useEffect } from 'react';
import { useRouter } from 'next/router';

const LoginPage = () => {
    const router = useRouter();

    useEffect(() => {
        router.push('https://256578554.propelauthtest.com');
    }, [router]);

    return null;
};

export default LoginPage;