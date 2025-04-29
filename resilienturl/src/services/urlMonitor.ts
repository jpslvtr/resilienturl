import { supabase } from '../lib/supabase';

// This would be a scheduled function in production
export async function checkAndUpdateUrls() {
    try {
        // Get URLs that haven't been checked in the last 24 hours
        const { data: urlsToCheck, error: fetchError } = await supabase
            .from('url_mappings')
            .select('*')
            .lt('last_checked', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

        if (fetchError) {
            console.error('Error fetching URLs to check:', fetchError);
            return;
        }

        if (!urlsToCheck || urlsToCheck.length === 0) {
            console.log('No URLs need checking at this time');
            return;
        }

        console.log(`Checking ${urlsToCheck.length} URLs for changes...`);

        for (const urlMapping of urlsToCheck) {
            try {
                // First, try a HEAD request to check for redirects
                const response = await fetch(urlMapping.current_destination, {
                    method: 'HEAD',
                    redirect: 'manual' // Don't automatically follow redirects
                });

                let newDestination = urlMapping.current_destination;

                // If we got a redirect response
                if (response.status >= 300 && response.status < 400) {
                    const location = response.headers.get('location');
                    if (location) {
                        // If it's a relative URL, resolve it against the current URL
                        newDestination = new URL(location, urlMapping.current_destination).toString();
                        console.log(`URL ${urlMapping.original_url} redirected to ${newDestination}`);
                    }
                }
                // If the URL is not accessible (404, etc.), we could implement the Google Search fallback here
                else if (response.status >= 400) {
                    console.log(`URL ${urlMapping.current_destination} returned status ${response.status}. Could implement Google Search fallback here.`);
                    // For MVP, we'll just keep the old URL
                }

                // Update the URL mapping with the new destination and update the last_checked timestamp
                const { error: updateError } = await supabase
                    .from('url_mappings')
                    .update({
                        current_destination: newDestination,
                        last_checked: new Date().toISOString()
                    })
                    .eq('id', urlMapping.id);

                if (updateError) {
                    console.error(`Error updating URL mapping ${urlMapping.id}:`, updateError);
                }
            } catch (err) {
                console.error(`Error checking URL ${urlMapping.current_destination}:`, err);

                // Just update the last_checked timestamp to avoid checking again immediately
                await supabase
                    .from('url_mappings')
                    .update({
                        last_checked: new Date().toISOString()
                    })
                    .eq('id', urlMapping.id);
            }
        }

        console.log('URL check completed');
    } catch (err) {
        console.error('Error in URL monitoring service:', err);
    }
}