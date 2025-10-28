
import React, { useState, useEffect } from 'react';

export const Clock: React.FC = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => {
            clearInterval(timerId);
        };
    }, []);

    return (
        <div className="hidden md:block text-right">
            <p className="text-sm font-mono text-white">
                {time.toUTCString().slice(5, 16)}
            </p>
            <p className="text-lg font-mono text-gray-400">
                {time.toUTCString().slice(17, 25)} UTC
            </p>
        </div>
    );
};
