import styles from './Button.module.css';

export default function Button({

    children,
    variant = 'primary',
    size = 'md',
    onClick,
    fullWidth = false,
    disabled = false,
    type = 'button',
    className = '',
}){
    const classes = [
        styles.button,
        styles[variant],
        size!== 'md' && styles[size],
        fullWidth && styles.full,
        className,
    ].filter(Boolean).join(' ');

    return (
        <button
           className={classes}
           onClick={onClick}
           disabled={disabled}
           type={type}
        >
           {children}
        </button>
    )
}