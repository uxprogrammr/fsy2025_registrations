import React from 'react';
import dynamic from "next/dynamic";

const WordCloud = dynamic(() => import("react-wordcloud"), { ssr: false });

export function WordCloudChart({ words, title }) {
    // Prepare words for the cloud
    const wordData = words.reduce((acc, word) => {
        const found = acc.find(w => w.text === word);
        if (found) {
            found.value += 1;
        } else {
            acc.push({ text: word, value: 1 });
        }
        return acc;
    }, []);

    // WordCloud options
    const options = {
        rotations: 2,
        rotationAngles: [-90, 0],
        fontSizes: [20, 60],
        enableTooltip: true,
        scale: 'sqrt',
        fontFamily: 'Arial',
    };

    return (
        <div className="p-4 bg-white">
            <h3 className="text-lg font-semibold mb-2 text-black">{title}</h3>
            <div style={{ width: '100%', height: '400px' }}>
                <WordCloud words={wordData} options={options} />
            </div>
        </div>
    );
}

export default WordCloudChart;
