"use client";
import React, {useEffect, useRef, useState} from "react";
import {motion} from 'framer-motion'


export const TextHoverEffect = ({text, duration, showStroke = true, strokeColor = "url(#textGradient)"}) => {
    const svgRef = useRef(null);
    const [cursor, setCursor] = useState({x: 0, y: 0});
    const [hovered, setHovered] = useState(false);
    const [maskPosition, setMaskPosition] = useState({cx: "50%", cy: "50%"});

    useEffect(() => {
        if (svgRef.current && cursor.x !== null && cursor.y !== null) {
            const svgRect = svgRef.current.getBoundingClientRect();
            const cxPercentage = ((cursor.x - svgRect.left) / svgRect.width) * 100;
            const cyPercentage = ((cursor.y - svgRect.top) / svgRect.height) * 100;
            setMaskPosition({
                cx: `${cxPercentage}%`,
                cy: `${cyPercentage}%`,
            });
        }
    }, [cursor]);

    return (
        <svg
            ref={svgRef}
            width="100%"
            height="100%"
            viewBox="0 0 300 100"
            xmlns="http://www.w3.org/2000/svg"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onMouseMove={(e) => setCursor({x: e.clientX, y: e.clientY})}
            style={{pointerEvents: 'all'}}
            className="select-none"
        >
            <defs>
                <linearGradient
                    id="textGradient"
                    gradientUnits="userSpaceOnUse"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                >
                    <stop offset="0%" stopColor="#06B6D4"/>
                    <stop offset="16%" stopColor="#3B82F6"/>
                    <stop offset="33%" stopColor="#8B5CF6"/>
                    <stop offset="66%" stopColor="#F59E0B"/>
                    <stop offset="83%" stopColor="#EF4444"/>
                    <stop offset="100%" stopColor="#06B6D4"/>
                </linearGradient>

                <motion.radialGradient
                    id="revealMask"
                    gradientUnits="userSpaceOnUse"
                    r="20%"
                    initial={{cx: "50%", cy: "50%"}}
                    animate={maskPosition}
                    transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 50,
                    }}>
                    {/*transition={{duration: duration ?? 0, ease: "easeOut"}}>*/}
                    <stop offset="0%" stopColor="white"/>
                    <stop offset="100%" stopColor="black"/>
                </motion.radialGradient>
                <mask id="textMask">
                    <rect x="0" y="0" width="100%" height="100%" fill="url(#revealMask)"/>
                </mask>
            </defs>
            <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                strokeWidth="0.3"
                className="fill-transparent stroke-white font-[helvetica] text-7xl font-bold"
                style={{opacity: hovered ? 0.7 : 0}}>
                {text}
            </text>
            <motion.text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                strokeWidth="0.5"
                className="fill-transparent font-[helvetica] text-7xl font-bold"
                stroke={strokeColor}
                initial={{strokeDashoffset: 1000, strokeDasharray: 1000}}
                animate={{
                    strokeDashoffset: 0,
                    strokeDasharray: 1000,
                }}
                transition={{
                    duration: 4,
                    ease: "easeInOut",
                }}
            >
                {text}
            </motion.text>
            <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                stroke="url(#textGradient)"
                strokeWidth="0.5"
                mask="url(#textMask)"
                className="fill-transparent font-[helvetica] text-7xl font-bold">
                {text}
            </text>
        </svg>
    )
        ;
};
