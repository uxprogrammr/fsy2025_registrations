import React from 'react';
import { TagCloud } from 'react-tagcloud';

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

    // Custom renderer for words to add separation and style
    const customRenderer = (tag, size, color) => (
        <span
            key={tag.value}
            style={{
                margin: '5px',
                padding: '5px 8px',
                display: 'inline-block',
                fontSize: `${size}px`,
                fontWeight: 'bold',
                borderRadius: '8px',
                backgroundColor: '#f0f4f8',
                color: color,
                // border: '1px solid #ccc',
            }}
        >
            {tag.value}
        </span>
    );

    return (
        <div className="p-4 bg-white">
            <h3 className="text-lg font-semibold mb-2 text-black">{title}</h3>
            <TagCloud
                minSize={14}
                maxSize={30}
                tags={wordData}
                className="text-black"
                colorOptions={{ hue: 'blue' }}
                renderer={customRenderer}
            />
        </div>
    );
}

export default WordCloudChart;
