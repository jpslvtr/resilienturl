import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

function HomePage() {
    const [url, setUrl] = useState('');
    const [resilientUrl, setResilientUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const generateShortCode = () => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    };

    const createResilientUrl = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!url) {
            setError('Please enter a URL');
            return;
        }

        try {
            setIsLoading(true);
            setError('');

            // Validate URL format
            try {
                new URL(url);
            } catch (e) {
                setError('Please enter a valid URL including http:// or https://');
                setIsLoading(false);
                return;
            }

            const shortCode = generateShortCode();
            const newResilientUrl = `${window.location.origin}/r/${shortCode}`;

            // Insert into Supabase
            const { error: insertError } = await supabase
                .from('url_mappings')
                .insert({
                    original_url: url,
                    resilient_url: newResilientUrl,
                    current_destination: url
                });

            if (insertError) {
                throw new Error(insertError.message);
            }

            setResilientUrl(newResilientUrl);
        } catch (err) {
            setError('Error creating resilient URL: ' + (err instanceof Error ? err.message : String(err)));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <header>
                <div className="container">
                    <a href="/" className="logo">ResilientURL</a>
                </div>
            </header>

            <section className="hero">
                <div className="container">
                    <h1>Never worry about broken links again</h1>
                    <p>
                        ResilientURL automatically keeps your links working, even when the original URLs change.
                        No more link rot, no manual maintenance.
                    </p>
                </div>
            </section>

            <div className="tools-container">
                <div className="tool-card">
                    <h2>URL Converter</h2>
                    <p>Convert your links to resilient links that automatically update when URLs change.</p>

                    <form onSubmit={createResilientUrl}>
                        <div className="form-group">
                            <label htmlFor="url-input">Enter a URL:</label>
                            <input
                                id="url-input"
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://example.com/page"
                                required
                            />
                        </div>

                        <button type="submit" disabled={isLoading}>
                            {isLoading ? 'Creating...' : 'Create Resilient URL'}
                        </button>

                        {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}

                        {resilientUrl && (
                            <div className="result">
                                <h3>Your Resilient URL:</h3>
                                <p><a href={resilientUrl} target="_blank" rel="noopener noreferrer">{resilientUrl}</a></p>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(resilientUrl);
                                        alert('Copied to clipboard!');
                                    }}
                                    style={{ marginTop: '1rem' }}
                                >
                                    Copy to Clipboard
                                </button>
                            </div>
                        )}
                    </form>
                </div>

                <div className="tool-card">
                    <h2>CLI Tool</h2>
                    <p>Automatically rewrite links in your website or documentation with our command-line tool.</p>

                    <div className="cli-instructions">
                        <p># Install the ResilientURL CLI tool</p>
                        <p>$ npm install -g resilienturl-cli</p>
                        <p>&nbsp;</p>
                        <p># Convert links in a file</p>
                        <p>$ resilienturl convert --file path/to/file.html</p>
                        <p>&nbsp;</p>
                        <p># Convert links in all HTML files in a directory</p>
                        <p>$ resilienturl convert --dir path/to/directory</p>
                    </div>

                    <p style={{ marginTop: '1rem', fontStyle: 'italic' }}>Coming soon! Sign up to be notified when the CLI tool is available.</p>
                </div>
            </div>

            <footer>
                <div className="container">
                    <p>&copy; {new Date().getFullYear()} ResilientURL. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}

export default HomePage;