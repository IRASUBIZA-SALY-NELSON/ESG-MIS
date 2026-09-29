/* eslint-disable @typescript-eslint/ban-types */
import { AuthApi } from '@/utils/constants';
import { Textarea } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';

const CommentOnAppeal = ({ toComment, close }: { toComment: any; close: Function }) => {
  const [comment, setComment] = useState<string | any>(toComment?.comment);
  const submitComment = async (e: any) => {
    e.preventDefault();
    if (toComment?.comment === comment || comment?.length === 0) return;
    AuthApi.put(`/academicAppeals/comment/${toComment.id}`, {
      comment,
      status: toComment?.status,
    })
      .then((res: any) => {
        notifications.show({
          title: 'Comment Submitted',
          message: 'Comment has been submitted successfully',
          color: 'green',
        });
        close();
      })
      .catch((err: any) => {
        notifications.show({
          title: 'Comment Error Occured',
          message: err.message,
          color: 'green',
        });
      });
  };
  return (
    <div className="w-full h-full">
      <form className="w-full flex flex-col gap-1 mt-3" onSubmit={submitComment}>
        <h6 className="text-[80%]">Comment</h6>
        <textarea
          value={comment}
          onChange={(e: any) => setComment(e.target.value)}
          maxLength={254}
          name="comment"
          placeholder="Write Comment ..."
          className="border border-[#ccc] font-semibold resize-none rounded-lg outline-none mb-2 px-3 pt-2 text-[80%] pb-20"
        />
        <button type="submit" className="bg-mainPurple text-white py-2 px-4 rounded-md">
          Submit
        </button>
      </form>
    </div>
  );
};

export default CommentOnAppeal;
