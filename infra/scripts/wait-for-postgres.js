import child from "child_process";

process.stdout.write("\n🟨 Waiting for postgres");

function check() {
  function onDockerExec(_, stdout) {
    if (stdout.search("accepting connections") !== -1) {
      console.log("\n✅ Postgres is accepting connections\n");
      return;
    }
    setTimeout(check, 350);
    process.stdout.write(".");
  }
  child.exec(
    "docker exec postgres-dev pg_isready --host localhost",
    onDockerExec,
  );
}

check();
