export default async function makeRequest(url, options, timeout) {
  if (options.qs) {
    const esc = encodeURIComponent;
    const query = Object.keys(options.qs)
      .map(k => `${esc(k)}=${esc(options.qs[k])}`)
      .join('&');
    url = `${url}?${query}`; // eslint-disable-line
    delete options.qs; // eslint-disable-line
  }

  const timeoutTrigger = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('timeout')), timeout)
  );

  const res = await Promise.race([fetch(url, options), timeoutTrigger]);
  const resJSON = (await res.json()) || {};
  if (!res.ok) {
    if (!resJSON.errors) {
      throw new Error(resJSON.status);
    }

    const backendErrMessage = resJSON.errors.reduce(
      (name, err) => `${name}${err.title} `,
      ''
    );
    throw new Error(backendErrMessage.trim());
  }

  return resJSON;
}
