import { useState } from 'react';
import { Button } from '../Button'
import css from './index.module.css'


export function LinkShorts() {
    const [url, setUrl] = useState('');
    const [shortUrl, setShortUrl] = useState('');

    // Обработчик кнопки сокращения ссылки
    function handleClick(){
        setShortUrl(url);
    }

    // Обработчик кнопки копирования в буфер обмена
    const handleCopy = async () => {
        if (!shortUrl) return;
        try {
            await navigator.clipboard.writeText(shortUrl);
            alert('Ссылка скопирована!');
        } catch {
            // fallback для старых браузеров
            const textarea = document.createElement('textarea');
            textarea.value = shortUrl;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            alert('Ссылка скопирована!');
        }
    }
    
    return (
        <section>
            <h2>Блок для короткой ссылки</h2>
            <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} />
            <Button onClick={handleClick}>Сократить ссылку</Button>

            {shortUrl && (
                <div>
                    <a href={shortUrl} target='_blank'>{shortUrl}</a>
                    <button onClick={handleCopy}>Копировать в буфер обмена</button>
                </div>
            )}
        </section>
    )
}