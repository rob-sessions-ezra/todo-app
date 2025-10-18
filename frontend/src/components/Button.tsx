interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary';
}

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
    const baseStyles = 'px-4 py-2 rounded-md font-medium transition-colors';
    const variantStyles = variant === 'primary'
        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200';

    return (
        <button
            className={`${baseStyles} ${variantStyles} ${className}`}
            {...props}
        />
    );
}
