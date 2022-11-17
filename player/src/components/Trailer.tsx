import React from 'react'

interface Props {
  trailerUrl: string
}

const Trailer: React.FC<Props> = ({ trailerUrl }) => (
  <iframe frameBorder="0" height="100%" width="100%" src={trailerUrl} />
)

export default Trailer
