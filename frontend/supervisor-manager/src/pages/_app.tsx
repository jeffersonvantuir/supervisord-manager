import MainLayout from '@/components/Layout/MainLayout';
import { AppProps } from 'next/app';
import 'antd/dist/reset.css';

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <MainLayout>
            <Component {...pageProps} />
        </MainLayout>
    );
}

export default MyApp;
