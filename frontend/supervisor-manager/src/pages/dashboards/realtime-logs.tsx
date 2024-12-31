import { useRouter } from 'next/router';

const RealtimeLogs: React.FC = () => {
    const router = useRouter();
    const { process } = router.query; // Obtemos o parâmetro da URL

    return (
        <div style={{ padding: '20px' }}>
            <h1>Logs em Tempo Real</h1>
            <p>Processo selecionado: {process}</p>
            {/* Aqui você pode adicionar a lógica para exibir os logs */}
        </div>
    );
};

export default RealtimeLogs;
