import React from 'react'

import localization from '../localization'
import { getAlternativeUrl } from '../utils'
import { Typography } from '@mui/material'

interface Props {
  query: string
  provider: string
  message: string
}

const AlternativeLinksError: React.FC<Props> = ({ query, provider, message }) => (
  <Typography className="center shadow-border" variant="h4">
    <span>{message}</span>
    <br />
    <a href={getAlternativeUrl(provider, query)}>
      {localization.searchAlternatives}
    </a>
  </Typography>
)

export default AlternativeLinksError
