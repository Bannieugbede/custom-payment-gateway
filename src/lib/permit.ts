/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/permit.ts

import {Permit} from 'permitio'

const permit = new Permit({
  pdp: "https://cloudpdp.api.permit.io",
  token:process.env.PERMIT_API_KEY
})

export default permit;