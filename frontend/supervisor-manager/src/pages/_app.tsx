import { AuthProvider } from '@/contexts/AuthContext';
import MainLayout from '@/components/Layout/MainLayout';
import { publicRoutes } from "../interface/Routing";
import { useRouter } from "next/router";
import { AppProps } from 'next/app';
import 'antd/dist/reset.css';

function MyApp({ Component, pageProps }: AppProps) {
    const route = useRouter();
    const currentPath = route.pathname ? route.pathname : "/";

    return (
        <>
            {publicRoutes.includes(currentPath) ? (
                <Component {...pageProps} />
            ) : (
                <AuthProvider>
                    <MainLayout>
                        <Component {...pageProps} />
                    </MainLayout>
                </AuthProvider>
            )}
        </>
    );
}

export default MyApp;
