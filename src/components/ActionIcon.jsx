import { forwardRef } from 'react';

const ActionIcon = forwardRef(function ActionIcon(
  { icon: Icon, label, variant = 'secondary', size = 18, className = '', as: Component = 'button', ...props },
  ref
) {
  const compProps = {
    ref,
    ...(Component === 'button' && { type: 'button' }),
    'aria-label': label,
    'data-tooltip': label,
    className: `action-icon icon-btn ${variant} ${className}`.trim(),
    ...props,
  };
  return (
    <Component {...compProps}>
      <Icon size={size} />
    </Component>
  );
});

export default ActionIcon;
