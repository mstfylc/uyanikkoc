/* Öğrenci listesi (roster) store'u — COACH_STUDENTS'tan tohumlanır,
   "Öğrenci ekle" ile büyür, localStorage'da kalıcı. */

const ROSTER_KEY = "uk_roster_v1";
const rosterClone = (o) => JSON.parse(JSON.stringify(o));

let _roster = (() => {
  try { const s = localStorage.getItem(ROSTER_KEY); if (s) return JSON.parse(s); } catch (e) {}
  return rosterClone(COACH_STUDENTS);
})();

const _rListeners = new Set();
function getRoster() { return _roster; }
function setRoster(next) {
  _roster = typeof next === "function" ? next(_roster) : next;
  try { localStorage.setItem(ROSTER_KEY, JSON.stringify(_roster)); } catch (e) {}
  _rListeners.forEach((l) => l());
}
function addStudent(s) {
  const id = "n" + Date.now();
  const student = {
    id, name: s.name, grade: s.grade || "11 · Sayısal",
    completion: 0, net: 0, risk: s.risk || "normal", last: "Yeni eklendi",
    trend: [0, 0, 0, 0, 0, 0], sube: s.sube || "", numara: s.numara || "", hedef: s.hedef || "",
  };
  setRoster((r) => [...r, student]);
  return student;
}
function resetRoster() { setRoster(rosterClone(COACH_STUDENTS)); }

function useRoster() {
  const [, force] = React.useState(0);
  React.useEffect(() => { const l = () => force((x) => x + 1); _rListeners.add(l); return () => _rListeners.delete(l); }, []);
  return _roster;
}

Object.assign(window, { getRoster, setRoster, addStudent, resetRoster, useRoster });
