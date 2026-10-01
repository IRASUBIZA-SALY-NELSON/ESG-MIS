export default function teardown() {
  process.exit(process.exitCode ?? 0);
}
