import React from 'react';

export function WordCloudChart({ words, title }) {
    // Prepare words for the cloud
    const wordData = words.reduce((acc, word) => {
        const found = acc.find(w => w.value === word);
        if (found) {
            found.count += 1;
        } else {
            acc.push({ value: word, count: 1 });
        }
        return acc;
    }, []);

    // Generate a random font size between 14 and 30
    const getRandomFontSize = () => Math.floor(Math.random() * (24 - 14 + 1)) + 14;

    return (
        <div className="p-4 bg-white">
            <h3 className="text-lg font-semibold mb-2 text-black">{title}</h3>
            <div className="flex flex-wrap">
                {wordData.map((tag, index) => (
                    <span
                        key={index}
                        style={{
                            margin: '5px',
                            padding: '5px 8px',
                            display: 'inline-block',
                            fontSize: `${getRandomFontSize()}px`,
                            fontWeight: 'bold',
                            borderRadius: '8px',
                            backgroundColor: '#f0f4f8',
                            color: '#3498db',
                        }}
                    >
                        {tag.value} ({tag.count})
                    </span>
                ))}
            </div>
        </div>
    );
}

export default WordCloudChart;
