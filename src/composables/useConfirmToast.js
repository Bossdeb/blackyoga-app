import { h } from 'vue'
import { useToast } from 'vue-toastification'

export function useConfirmToast() {
	const toast = useToast()

	const confirmToast = (message, options = {}) => {
		const {
			okText = 'ยืนยัน',
			cancelText = 'ยกเลิก'
		} = options

		return new Promise((resolve) => {
			toast((t) => {
				return h('div', { class: 'text-gray-900' }, [
					h('div', { class: 'font-medium' }, message),
					h(
						'div',
						{ class: 'flex items-center gap-2 mt-3' },
						[
							h(
								'button',
								{
									class:
										'px-3 py-1.5 rounded-lg bg-lineGreen text-white text-sm hover:bg-green-600',
									onClick: () => {
										resolve(true)
										toast.dismiss(t.id)
									}
								},
								okText
							),
							h(
								'button',
								{
									class:
										'px-3 py-1.5 rounded-lg bg-gray-200 text-gray-800 text-sm hover:bg-gray-300',
									onClick: () => {
										resolve(false)
										toast.dismiss(t.id)
									}
								},
								cancelText
							)
						]
					)
				])
			}, {
				position: 'top-center',
				timeout: 0,
				closeOnClick: false,
				hideProgressBar: true
			})
		})
	}

	return { confirmToast }
}


