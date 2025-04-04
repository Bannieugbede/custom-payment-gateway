/* eslint-disable @typescript-eslint/no-explicit-any */
import {Permit} from 'permitio'

const permit = new Permit({
  token: process.env.PERMIT_API_KEY,
  pdp: "https://cloudpdp.api.permit.io",
});

export default permit;