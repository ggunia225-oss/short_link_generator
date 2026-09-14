import { useState } from 'react';
import { Button } from '../Button'
import { getStats } from '../../api/client';
import css from './index.module.css'


export function LinkStats() {
    const [code, setCode] = useState('');
    const [stats, setStats] = useState<null | {
        originalUrl: string;
        shortCode: string;
        clicks: number;
        createdAt: string;
    }>(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Обработчик кнопки получения статистики
    const handleClick = async () => {
        if (!code.trim()){
            setError('Введите короткий код');
            return;
        }

        setError('');
        setLoading(true);

        try {
            const data = await getStats(code);
            setStats(data);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Код не найден'
            setError(message);
            setStats(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section>
            <h2>Блок для статистики ссылки</h2>
            <input type="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Введите короткий код" />
            <Button onClick={handleClick} disabled={loading}>{loading ? 'Загрузка...' : 'Получить статистику'}</Button>
            
            {error && <p className={css.error} >{error}</p>}

            {stats && (
                <div className={css.stats}>
                    <p>Статистика url</p>
                    <ul>
                        <li>Оригинальный URL: {stats.originalUrl}</li>
                        <li>Количество переходов: {stats.clicks}</li>
                        <li>Дата создания: {stats.createdAt}</li>
                    </ul>
                </div>
            )}
        </section>
    )
}