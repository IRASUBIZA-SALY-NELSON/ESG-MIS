export interface SearchInputProps {
  type: any;
  placeholder: string;
  value: string | undefined;
  handleChange?: (e: any) => void;
}
const SearchInput = (props: SearchInputProps) => {
  return (
    <input
      type={props.type}
      value={props.value}
      placeholder={props.placeholder}
      onChange={() => props.handleChange}
      className="px-4 py-2 border rounded-lg border-[#4343433] w-1/3 bg-[#EEF5F1] text-[gray] outline-none font-medium"
    />
  );
};
export default SearchInput;
