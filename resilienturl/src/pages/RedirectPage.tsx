import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function RedirectPage() {
    const { shortCode } = useParams<{ shortCode: string }>();
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const handleRedirect = async () => {
            try {
                setIsLoading(true);

                if (!shortCode) {
                    setError('Invalid link');
                    return;
                }

                const resilientUrl = `${window.location.origin}/r/${shortCode}`;

                // Find the URL mapping
                const { data, error: fetchError } = await supabase
                    .from('url_mappings')
                    .select('*')
                    .eq('resilient_url', resilientUrl)
                    .single();

                if (fetchError || !data) {
                    setError('Link not found');
                    return;
                }

                // Redirect to the current destination
                window.location.href = data.current_destination;

            } catch (err) {
                setError('Error redirecting: ' + (err instanceof Error ? err.message : String(err)));
            } finally {
                setIsLoading(false);
            }
        };

        handleRedirect();
    }, [shortCode]);

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            flexDirection: 'column',
            padding: '1rem'
        }}>
            {isLoading ? (
                <>
                    <h2>Redirecting you...</h2>
                    <p>Please wait while we take you to your destination.</p>
                </>
            ) : error && (
                <>
                    <h2>Oops! Something went wrong</h2>
                    <p>{error}</p>
                    <a href="/" style={{ marginTop: '1rem', color: 'var(--primary-color)' }}>
                        Go back to home
                    </a>
                </>
            )}
        </div>
    );
}

export default RedirectPage;