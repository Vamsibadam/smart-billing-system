function Loader({
  text = "Loading..."
}) {

  return (
    <div
      className="
      flex
      flex-col
      justify-center
      items-center
      h-[60vh]
      gap-4
      "
    >

      <div
        className="
        h-12
        w-12
        border-4
        border-slate-200
        border-t-indigo-600
        rounded-full
        animate-spin
        "
      />

      <p
        className="
        text-slate-500
        font-medium
        "
      >
        {text}
      </p>

    </div>
  );
}

export default Loader;