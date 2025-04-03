import Image from "next/image";

export default function Nav() {
  return (
    <div className="flex flex-row m-2 mx-4">
      <div className="flex flex-row items-center gap-2">
        <Image src="/logo.png" alt="Logo" width={75} height={75} />
        <div>
          <div className="font-serif text-[#b18819] text-lg p-0">
            PAMANTASAN NG LUNGSOD NG MAYNILA
          </div>
          <p className=" text-[#0e243c]">University of the City of Manila</p>
        </div>
      </div>
    </div>
  );
}
