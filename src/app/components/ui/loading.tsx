import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-50 z-50">
      <div className="bg-emeraldGreen-300 p-8 rounded-full shadow-xl flex items-center justify-center text-blue-500 text-4xl">
        <FontAwesomeIcon icon={faSpinner} spin />
      </div>
    </div>
  );
}
