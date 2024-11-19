import React from 'react';
import '../../styles/animations.css';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'glass' | 'outlined';
    animate?: boolean;
    hover?: boolean;
    delay?: number;
    style?: React.CSSProperties;
}

const Card: React.FC<CardProps> = ({
    children,
    className = '',
    variant = 'default',
    animate = false,
    hover = true,
    delay = 0,
    style = {}
}) => {
    const baseStyles = 'rounded-xl p-6 transition-all duration-300';
    
    const variants = {
        default: 'bg-white shadow-sm',
        glass: 'glass-effect',
        outlined: 'border-2 border-gray-200 bg-white/50'
    };

    const animations = animate ? 'animate-scale-in' : '';
    const hoverEffect = hover ? 'card-shadow' : '';

    const mergedStyle = delay ? { ...style, animationDelay: `${delay}s` } : style;

    return (
        <div 
            className={`${baseStyles} ${variants[variant]} ${animations} ${hoverEffect} ${className}`}
            style={mergedStyle}
        >
            {children}
        </div>
    );
};

export default Card;
