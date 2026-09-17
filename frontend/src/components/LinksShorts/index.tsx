import { useState } from 'react';
import { Button } from '../Button'
import { shortenUrl } from '../../api/client';
import css from './index.module.css'


export function LinkShorts() {
    const [url, setUrl] = useState('');
    const [shortUrl, setShortUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Обработчик кнопки сокращения ссылки
    const handleClick = async () =>{
        if (!url.trim()) {
            setError('Введите URL');
            return;
        }

        setError('');
        setLoading(true);
        
        try {
            const data = await shortenUrl(url);
            setShortUrl(data.shortUrl);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Не удалось сократить ссылку'
            setError(message);
            setShortUrl('');
        } finally {
            setLoading(false);
        }
    };

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
    };
    
    return (
        <section>
            <h2>Блок для короткой ссылки</h2>
            <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Введите URL" />
            <Button onClick={handleClick} disabled={loading}>{loading ? 'Сокращение...' : 'Сократить ссылку'}</Button>

            { error && <p className={ css.error }>{error}</p>}
            
            {shortUrl && (
                <div>
                    <a className='link' href={shortUrl} target='_blank' rel="noopener noreferrer">{shortUrl}</a>
                    <button onClick={handleCopy}>Копировать в буфер обмена</button>
                </div>
            )}
        </section>
    )
};