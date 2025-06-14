import styles from '../../styles/button.module.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = ({ variant = 'default', size = 'sm', className = '', disabled = false, children, ...rest }: ButtonProps) => {

  const classes = [
    styles.button,
    styles[variant],
    styles[size],
    className
  ].join(' ').trim();

  return (
    <button
      className={classes}
      disabled={disabled}
      aria-disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  )
}
