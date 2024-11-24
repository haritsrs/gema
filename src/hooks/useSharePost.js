import { useCallback } from 'react';

export const useSharePost = () => {
  const sharePost = useCallback(async (post) => {
    const postUrl = `${window.location.origin}/posts/${post.id}`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title || "Check this out!",
          text: post.content || "Take a look at this post on GEMA,",
          url: postUrl,
        });
        return { success: true, method: 'webshare' };
      } else {
        await navigator.clipboard.writeText("Check this out! \nTake a look at this post on GEMA, \n \n" + postUrl);
        return { success: true, method: 'clipboard' };
      }
    } catch (error) {
      console.log('Error sharing post!\n', error);
      return { success: false, error };
    }
  }, []);

  return sharePost;
};
