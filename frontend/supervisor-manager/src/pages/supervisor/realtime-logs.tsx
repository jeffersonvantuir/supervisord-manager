import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import { Card, Spin } from 'antd';
import api from "@/services/api";

const RealtimeLogs: React.FC = () => {
    const router = useRouter();
    const { server_id, process } = router.query; // Obtém parâmetros da URL
    let offset = 0;

    const [logs, setLogs] = useState<string>(""); // Estado para os logs
    const [loading, setLoading] = useState<boolean>(true);

    // Referência para o contêiner dos logs
    const logsContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!server_id || !process) return; // Aguarda os parâmetros da URL serem definidos

        const fetchLogs = async () => {
            try {
                const response = await api.get(`/supervisor/process/realtime-logs`, {
                    params: { server_id, process, offset }, // Passa os parâmetros no query string
                });

                offset = response.data.offset;
                if (response.data.log != '') {
                    setLogs((prevLogs) => `${response.data.log}`); // Atualiza os logs
                }
            } catch (error) {
                console.error("Erro ao buscar logs:", error);
            } finally {
                setLoading(false);
            }
        };

        // Configura o polling para buscar os logs a cada 2 segundos
        const intervalId = setInterval(fetchLogs, 2000);
        fetchLogs(); // Busca os logs imediatamente

        return () => clearInterval(intervalId); // Limpa o intervalo ao desmontar o componente
    }, [server_id, process]);

    // Efeito para rolar automaticamente para o final
    useEffect(() => {
        if (logsContainerRef.current) {
            logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
        }
    }, [logs]); // Executa sempre que os logs forem atualizados

    return (
        <div style={{ padding: '20px' }}>
            <h1>Logs em Tempo Real</h1>
            <h3><strong>Processo</strong>: {process}</h3>
            <Card
                style={{
                    backgroundColor: "#1e1e1e",
                    color: "#d4d4d4",
                    fontFamily: "monospace",
                    overflowY: "scroll",
                    maxHeight: "400px",
                    padding: "10px",
                }}
                bodyStyle={{ height: "100%" }}
                ref={logsContainerRef} // Associa o contêiner à referência
            >
                {loading ? (
                    <div style={{ textAlign: "center" }}>
                        <Spin size="large" />
                    </div>
                ) : (
                    <pre>{logs}</pre> // Exibe os logs no formato de texto
                )}
            </Card>
        </div>
    );
};

export default RealtimeLogs;
