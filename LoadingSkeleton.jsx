export default function LoadingSkeleton({ rows = 5, cols = 6 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r}>
          {Array.from({ length: cols }).map((__, c) => (
            <td key={c}>
              <span className="placeholder-glow d-block">
                <span className="placeholder col-8" />
              </span>
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}
