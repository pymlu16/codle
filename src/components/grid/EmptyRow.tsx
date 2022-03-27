import { Cell } from './Cell'
type Props = {
  len: number
}

export const EmptyRow = ({ len }: Props) => {
  const emptyCells = Array.from(Array(len))

  return (
    <div className="flex justify-center mb-1">
      {emptyCells.map((_, i) => (
        <Cell key={i} />
      ))}
    </div>
  )
}
