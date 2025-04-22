import {Permit} from 'permitio'

const permit = new Permit({
  token: process.env.PERMIT_API_KEY,
  pdp: process.env.PERMIT_IO_PDP_URL,
});

export default permit;