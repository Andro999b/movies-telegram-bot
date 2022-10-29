import React from 'react'

import localization from '../localization'
import { getAlternativeUrl } from '../utils'
import { Typography } from '@material-ui/core'

export default ({ query, provider, message }) => (
  <Typography className="center shadow-border" variant="h4">
    <span>{message}</span>
    <br />
    <a href={getAlternativeUrl(provider, query)}>
      {localization.searchAlternatives}
    </a>
  </Typography>
)
