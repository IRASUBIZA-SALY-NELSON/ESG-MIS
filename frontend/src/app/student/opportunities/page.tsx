import Opportunity from '@/components/Opportunity/Opportunity';

const Opportunities = () => {
  return (
    <div className="w-full h-full overflow-y-auto">
      <header className="text-[#000000B2] font-semibold mx-1 my-3">Up-coming Opportunities</header>

      <div className="w-full  grid  md:grid-cols-3 gap-x-3 gap-y-5  oppts-container">
        {/* <Opportunity
          titleHeader={'Hanga Pitch Festival'}
          content={
            'There are many variations of passages of Lorem Ipsumffered alteration in some form, bylightly believable. If you are going  . . .'
          }
          time={'Sunday 24th September, 2020'}
          displayImage={OppImage}
        /> */}
      </div>
    </div>
  );
};

export default Opportunities;
