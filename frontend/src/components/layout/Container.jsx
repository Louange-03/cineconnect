export function Container({ children, className = "" }) {
  return <div className={`container-app ${className}`.trim()}>{children}</div>
}
