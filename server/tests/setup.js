// The routes log every create / cache miss with console.log. Hide those in
// test runs so the Jest output (locally and in GitHub Actions) stays readable;
// console.error is untouched. TEST_LOGS=true shows them again.
if (process.env.TEST_LOGS !== 'true') {
  console.log = () => {};
}
