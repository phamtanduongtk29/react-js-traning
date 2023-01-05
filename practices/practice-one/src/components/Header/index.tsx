import { FormEvent, useState, MouseEvent, ChangeEvent, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import useStore from 'hooks/useStore';
import Overlay from 'components/Overlay';
import Form from 'components/Form';
import Button from 'components/Button';
import Heading from 'components/Heading';
import Paragraph from 'components/Paragraph';
import Input from 'components/Input';
import Loading from 'components/Loading';
import { navLinks } from 'constants/navLinks';
import { firebaseService, cloudinaryUpload } from 'services';
import { setBlog, setLoading } from 'reduxs/actions';
import { getSearchParams, validation } from 'helpers';
import { Collection } from 'constants/firebase';
import cinndy from 'assets/images/cinndy.jpg';
import cector from 'assets/icons/vector.svg';
import './header.css';
import { SearchParams } from 'constants/searchParams';
import useDebounce from 'hooks/useDebounce';
import useNotification from 'hooks/useNotification';
import { show } from 'reduxs/notificationAction';
import { NotificationMessage } from 'constants/notification';
import { Message, showNotification } from 'helpers/notification';

const Header = () => {
    const [state, dispatch] = useStore();
    const [notify, dispatchNotify] = useNotification();
    const [searchParams, setSearchparams] = useSearchParams();
    const [isShowForm, setIsShowForm] = useState(false);
    const image = useRef<File>(new File([], ''));
    const { blog, loading } = state;
    const currentCategory = searchParams.get(SearchParams.Category) || '';

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        try {
            const { dataFields, error } = validation(blog);
            if (error) {
                // TODO: I will add the error message later
                alert('Error');
                return;
            }
            dispatch(setLoading(true));
            const { data } = await cloudinaryUpload(image.current);
            const payload = {
                ...blog,
                image: data.url,
                uid: state.uid,
                createdAt: Date.now(),
            };
            await firebaseService(Collection.BLOG).addData(payload);
            dispatch(setLoading(false));
            dispatchNotify(
                show({
                    message: NotificationMessage.ADD_BLOG_SUCCESS,
                    variant: 'success',
                })
            );
            dispatch(
                setBlog({
                    image: '',
                    title: '',
                    category: '',
                })
            );
        } catch (error) {
            showNotification(error as Message, (message) => {
                dispatchNotify(
                    show({
                        message,
                        variant: 'error',
                    })
                );
            });
        }
    };

    const closeForm = (event: MouseEvent) => {
        setIsShowForm(false);
        dispatch(
            setBlog({
                image: '',
                title: '',
                category: '',
            })
        );
    };

    const handleSetValueBlog = (event: ChangeEvent) => {
        type InputType = HTMLInputElement | HTMLSelectElement;
        const element: InputType = event.target as InputType;
        const key: string = element.name;
        let value: string = element.value;
        if (element.type === 'file') {
            const fileElement: HTMLInputElement = element as HTMLInputElement;
            const file = fileElement.files
                ? fileElement.files[0]
                : new File([], 'default.jpg');
            value = URL.createObjectURL(file);
            image.current = file;
        }
        dispatch(
            setBlog({
                ...blog,
                [key]: value,
            })
        );
    };

    const debounce = useDebounce((value) => {
        let search = getSearchParams(searchParams);
        search['title'] = value;
        if (!value) {
            const { title, ...rest } = search;
            search = rest;
        }
        setSearchparams(search);
    });

    return (
        <header className="container">
            <section className="header-logo">
                <Link to="/" className="header-logo-link">
                    <img src={cector} alt="Logo website" />
                    <img src={cinndy} alt="Logo website" />
                </Link>
            </section>
            <section className="header-heading">
                <section className="header-heading-item">
                    <Heading tag="h1" title="Blog" />
                    <Paragraph content="Stay up to date with our portfolio" />
                </section>
                <section className="header-heading-item">
                    <Button
                        variant="primary"
                        title="New blog"
                        size="md"
                        onClick={(event: MouseEvent) => {
                            setIsShowForm(true);
                        }}
                    />
                </section>
            </section>
            <section className="header-filter">
                <nav className="header-navigation">
                    {navLinks.map(({ title, path }, index) => {
                        const category = path ? `/blog?category=${path}` : '';
                        const active = path.trim() === currentCategory.trim();

                        return (
                            <Button
                                tag="a"
                                title={title}
                                path={category}
                                key={index}
                                active={active}
                            />
                        );
                    })}
                </nav>
                <section className="header-filter-search">
                    <Input
                        type="text"
                        name="filter"
                        placeholder="Give me a keyword..."
                        onChange={debounce}
                    />
                </section>
            </section>
            {isShowForm && (
                <Overlay onClick={closeForm}>
                    <Form
                        data={blog}
                        onSubmit={handleSubmit}
                        onChange={handleSetValueBlog}
                    />
                </Overlay>
            )}
            {loading && <Loading />}
        </header>
    );
};

export default Header;
