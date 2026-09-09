import { useState } from 'react';
import { Button } from '../Button'
import css from './index.module.css'



export function LinkStats() {
    const [url, setUrl] = useState('');
    const [stats, setStats] = useState(false);

    // Обработчик кнопки получения статистики
    function handleClick(){
        if (url != ''){
            setStats(true)
        } else {
            setStats(false)
        }
    }

    return (
        <section>
            <h2>Блок для статистики ссылки</h2>
            <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} />
            <Button onClick={handleClick}>Получить статистику</Button>
            
            {stats && (
                <div className={css.stats}>
                    <p>Статистика url</p>
                    <ul>
                        <li>Оригинальный URL:</li>
                        <li>Количество переходов:</li>
                        <li>Дата создания:</li>
                    </ul>
                </div>
            )}
        </section>
    )
}